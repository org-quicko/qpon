import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeysStore } from './store/api-keys.store';
import { OrganizationStore } from '../../../../store/organization.store';
import { CustomDatePipe } from '../../../../pipe/date.pipe';
import { SnackbarService } from '../../../../services/snackbar.service';
import { DeleteDialogComponent } from '../../common/delete-dialog/delete-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotAllowedDialogBoxComponent } from '../../../common/not-allowed-dialog-box/not-allowed-dialog-box.component';
import { AbilityServiceSignal } from '@casl/angular';
import { UserAbility } from '../../../../permissions/ability';
import { ApiKeyDto } from '../../../../../dtos/api-key.dto';
import { ApiCredentialsDialogComponent } from './common/api-credentials-dialog/api-credentials-dialog.component';


@Component({
    selector: 'app-api-keys',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDividerModule,
        MatCardModule,
        MatIconModule,
        MatTooltipModule,
        NgxSkeletonLoaderModule,
        CustomDatePipe,
    ],
    templateUrl: './api-keys.component.html',
})
export class ApiKeysComponent implements OnInit {
    apiKeysStore = inject(ApiKeysStore);
    organizationStore = inject(OrganizationStore);
    dialog = inject(MatDialog);
    snack = inject(SnackbarService);
    clipboard = inject(Clipboard);
    private readonly abilityService = inject<AbilityServiceSignal<UserAbility>>(AbilityServiceSignal);
	protected readonly can = this.abilityService.can;

    readonly apiKey = computed(() => this.apiKeysStore.apiKey());
    readonly isLoading = computed(() => this.apiKeysStore.isLoading());

    constructor() {
        // Watch for newly generated API key to show secret
        effect(() => {
			const apiKey = this.apiKeysStore.apiKey();
			if (apiKey?.secret) {
				const ref = this.dialog.open(ApiCredentialsDialogComponent, {
					width: '516px',
					disableClose: true,
					data: { apiKey },
				});
				ref.afterClosed().subscribe(() => {
					this.apiKeysStore.clearSecret();
				});
			}
		});
    }

    ngOnInit(): void {
        const organizationId = this.organizationStore.organizaiton()?.organizationId;

        if (organizationId) {
            this.apiKeysStore.fetchApiKey({ organizationId });
        }
    }

    onGenerateApiKey(): void {
        if (!this.can('manage', ApiKeyDto)) {
			this.dialog.open(NotAllowedDialogBoxComponent, {
				data: { description: 'You do not have permission to Generate an API key.' }
			});
			return;
		}
        const organizationId = this.organizationStore.organizaiton()?.organizationId;

        if (!organizationId) {
            this.snack.openSnackBar('Organization not found', undefined);
            return;
        }

        this.apiKeysStore.generateApiKey({ organizationId });
    }

    onRegenerateApiKey(): void {
        if (!this.can('manage', ApiKeyDto)) {
			this.dialog.open(NotAllowedDialogBoxComponent, {
				data: { description: 'You do not have permission to Generate an API key.' }
			});
			return;
		}
        const org = this.organizationStore.organizaiton();

        if (!org?.organizationId) {
            this.snack.openSnackBar('Organization not found', undefined);
            return;
        }

        this.dialog.open(DeleteDialogComponent, {
            width: '448px',
            data: {
                title: 'Regenerate API Key?',
                description: 'Are you sure you want to regenerate your API key? This will invalidate your current key and any applications using it will stop working until you update them with the new key.',
                buttonText: 'Regenerate',
                onDelete: async () => {
                    try {
                        await this.apiKeysStore.generateApiKey({ organizationId: org.organizationId! });
                        this.dialog.closeAll();
                    } catch (err) {
                        this.snack.openSnackBar('Failed to regenerate API key', undefined);
                    }
                }
            }
        });
    }

    copyToClipboard(text: string): void {
        const success = this.clipboard.copy(text);

        if (success) {
            this.snack.openSnackBar('Copied to clipboard', undefined);
        } else {
            this.snack.openSnackBar('Failed to copy', undefined);
        }
    }
}
