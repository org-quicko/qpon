import { DataSource, QueryRunner } from 'typeorm';
import { afterEach, beforeEach } from 'vitest';

export interface IsolatedTransaction {
  /** The runner every query in the test is pinned to. */
  queryRunner: QueryRunner;
  /** Undoes everything the test wrote and restores the DataSource. */
  rollback(): Promise<void>;
}

/**
 * Pins the whole application to a single open transaction, so a test's writes
 * are thrown away by a ROLLBACK instead of a TRUNCATE.
 *
 * The mechanism: TypeORM resolves a connection per operation through
 * `DataSource.createQueryRunner()` — repositories, `dataSource.manager`, the
 * `dataSource.transaction()` blocks inside services, and entity subscribers
 * all funnel through it. Swapping in one runner that already has a
 * transaction open makes every one of those share it. Service-level
 * `transaction()` calls then nest as SAVEPOINTs (TypeORM tracks
 * `transactionDepth`), so their own commits and rollbacks still behave
 * correctly relative to each other, while the outermost transaction remains
 * ours to discard.
 *
 * `release()` is neutralized for the duration because TypeORM releases a
 * runner back to the pool in the `finally` of every `transaction()` call —
 * without this the first service call would hand our connection away
 * mid-test.
 *
 * Two consequences worth knowing:
 *  - Everything runs on ONE connection, so a test cannot exercise genuine
 *    concurrency (parallel queries serialize in the pg client's queue).
 *  - `REFRESH MATERIALIZED VIEW CONCURRENTLY` is illegal inside a
 *    transaction block. Specs that drive a concurrent refresh must use
 *    `truncateAll` instead. Plain `REFRESH ... WITH DATA` is fine.
 */
export async function beginIsolatedTransaction(
  dataSource: DataSource,
): Promise<IsolatedTransaction> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  const originalRelease = queryRunner.release.bind(queryRunner);
  queryRunner.release = async () => {};

  // `createQueryRunner` normally lives on DataSource.prototype. Assigning
  // here adds an own property that shadows it; deleting that own property on
  // rollback restores the prototype method by identity, which re-binding a
  // captured copy would not.
  const hadOwnCreateQueryRunner = Object.prototype.hasOwnProperty.call(
    dataSource,
    'createQueryRunner',
  );
  // The unbound reference is the point: it is restored by identity on
  // rollback and never invoked here.
  // oxlint-disable-next-line typescript/unbound-method
  const previousCreateQueryRunner = dataSource.createQueryRunner;
  dataSource.createQueryRunner = () => queryRunner;

  return {
    queryRunner,
    async rollback() {
      if (hadOwnCreateQueryRunner) {
        dataSource.createQueryRunner = previousCreateQueryRunner;
      } else {
        delete (dataSource as Partial<DataSource>).createQueryRunner;
      }

      // A test that failed part-way can leave SAVEPOINTs open; unwind every
      // level so the connection is clean before it goes back to the pool.
      while (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      queryRunner.release = originalRelease;
      await queryRunner.release();
    },
  };
}

/**
 * Registers the beforeEach/afterEach pair for the common case. Takes a getter
 * rather than the DataSource itself so it can be called at describe level,
 * before the `beforeAll` that boots the app has run.
 */
export function useIsolatedTransaction(getDataSource: () => DataSource): void {
  let tx: IsolatedTransaction;

  beforeEach(async () => {
    tx = await beginIsolatedTransaction(getDataSource());
  });

  afterEach(async () => {
    await tx.rollback();
  });
}
