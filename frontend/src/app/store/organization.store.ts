import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { OrganizationDto } from '../../dtos/organization.dto';

type OrganizationState = {
  organizaiton: OrganizationDto | undefined;
};

const initialState: OrganizationState = {
  organizaiton: undefined,
};

export const OrganizationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setOrganization(organization: OrganizationDto) {
      patchState(store, {
        organizaiton: organization
      })
    }
  }))
);
