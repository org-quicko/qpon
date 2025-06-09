import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { OrganizationDto } from '../../dtos/organization.dto';
import { withDevtools } from "@angular-architects/ngrx-toolkit";

type OrganizationState = {
  organizaiton: OrganizationDto | undefined;
};

const initialState: OrganizationState = {
  organizaiton: undefined,
};

export const OrganizationStore = signalStore(
  { providedIn: 'root' },
  withDevtools('organization'),
  withState(initialState),
  withMethods((store) => ({
    setOrganization(organization: OrganizationDto) {
      patchState(store, {
        organizaiton: organization
      })
    }
  }))
);
