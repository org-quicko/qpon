import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DyanmicComponentDirective } from '../../directives/dyanmic-component.directive';
import { OrganizationUserStore } from '../../store/organization-user.store';
import { ActivatedRoute } from '@angular/router';
import { roleEnum } from '../../../enums';
import { SuperAdminOrganizationsComponent } from '../super-admin-organizations/super-admin-organizations.component';
import { OrganizationsComponent } from '../organizations/organizations.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dynamic-component-loader',
  imports: [DyanmicComponentDirective, MatProgressSpinnerModule],
  templateUrl: './dynamic-component-loader.component.html',
  styleUrls: ['./dynamic-component-loader.component.css'],
})
export class DynamicComponentLoaderComponent implements OnInit {
  @ViewChild(DyanmicComponentDirective) dynamicHost!: DyanmicComponentDirective;
  @Input() SuperAdminOrganizationsComponent!: SuperAdminOrganizationsComponent;
  @Input() OrganizationsComponent!: OrganizationsComponent;


  dynamicComponent: any;

  organizationUserStore = inject(OrganizationUserStore);

  organizations = this.organizationUserStore.organizations;
  isLoading = this.organizationUserStore.isLoading;

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    effect(() => {
      if (this.isLoading()) return;

      const organizations = this.organizations();
    
      const organization = organizations?.[0];
      const role = organization?.role;
    
      if (!role) return;
    
      this.dynamicComponent = role === roleEnum.SUPER_ADMIN
        ? this.SuperAdminOrganizationsComponent
        : this.OrganizationsComponent;
    
      queueMicrotask(() => this.loadComponent());
    });
  }

  ngOnInit() {
    this.route.data.subscribe((data: any) => {
      if (data.SuperAdminOrganizationsComponent) {
        this.SuperAdminOrganizationsComponent = data.SuperAdminOrganizationsComponent;
      }
      if (data.OrganizationsComponent) {
        this.OrganizationsComponent = data.OrganizationsComponent;
      }
    });
  }

  loadComponent() {
    // Clear the current view container
    this.dynamicHost.viewContainerRef.clear();
    // Dynamically create the selected component
    this.dynamicHost.viewContainerRef.createComponent(this.dynamicComponent);
  }
}
