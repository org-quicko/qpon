import { inject, Injectable } from '@angular/core';
import { defineUserAbilities, UserAbility } from '../permissions/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { roleEnum } from '../../enums';

@Injectable({ providedIn: 'root' })
export class PermissionsService {

	private readonly abilityService = inject(AbilityServiceSignal<UserAbility>);

	setAbilityForRole(role: roleEnum) {
		const ability = defineUserAbilities(role);
		this.abilityService.update(ability.rules);
	}
}
