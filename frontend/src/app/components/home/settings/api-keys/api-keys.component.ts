import { Component, OnInit, effect, inject, signal } from '@angular/core';
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
import { ApiKeyDto } from '../../../../../dtos/api-key.dto';

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

    showSecret = signal(false);

    constructor() {
        // Watch for newly generated API key to show secret
        effect(() => {
            const apiKey = this.apiKeysStore.apiKey();
            if (apiKey?.secret) {
                this.showSecret.set(true);
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
        const organizationId = this.organizationStore.organizaiton()?.organizationId;

        if (!organizationId) {
            this.snack.openSnackBar('Organization not found', undefined);
            return;
        }

        this.showSecret.set(false);
        this.apiKeysStore.generateApiKey({ organizationId });
    }

    onRegenerateApiKey(): void {
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
                        this.showSecret.set(false);
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

    downloadTxt(apiKey: ApiKeyDto): void {
        if (!apiKey) return;

        const textContent =
            `API Key: ${apiKey.key || ''}\n` +
            `Secret: ${apiKey.secret || ''}\n` +
            `Created At: ${apiKey.created_at || ''}\n`;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'api-key.txt';
        link.click();

        URL.revokeObjectURL(url);
    }

}
