/* eslint-disable max-classes-per-file */
import { Expose } from "class-transformer";
import { IsArray, IsNumber, IsOptional, ValidateNested } from "class-validator";

export class PaginatedList<T> {
	@Expose({ name: "items" })
	@ValidateNested({ each: true })
	@IsArray()
	private items?: Array<T>;

	@Expose({ name: "count" })
	@IsOptional()
	@IsNumber()
	count?: number;

	@Expose({ name: "skip" })
	@IsOptional()
	@IsNumber()
	skip?: number;

	@Expose({ name: "take" })
	@IsOptional()
	@IsNumber()
	take?: number;

	static Builder = class {
		static build<T>(dataList: Array<T>, skip: number, take: number, count?: number): PaginatedList<T> {
			const paginatedList = new PaginatedList<T>();
			paginatedList.setItems(dataList);

			if (count) {
				paginatedList.setCount(count);
			}

			paginatedList.setSkip(skip);
			paginatedList.setTake(take);

			return paginatedList;
		}
	};

	getItems(): Array<T> | undefined {
		return this.items;
	}

	setItems(value: Array<T>): void {
		this.items = value;
	}

	getCount(): number | undefined {
		return this.count;
	}

	setCount(value: number): void {
		this.count = value;
	}

	getSkip(): number | undefined {
		return this.skip;
	}

	setSkip(value: number): void {
		this.skip = value;
	}

	getTake(): number | undefined {
		return this.take;
	}

	setTake(value: number): void {
		this.take = value;
	}
}
