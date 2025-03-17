import { Global, Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { UserModule } from './user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthorizationService } from '../services/authorization.service';
import { OrganizationModule } from './organization.module';
import { CouponModule } from './coupon.module';
import { CampaignModule } from './campaign.module';
import { CouponCodeModule } from './coupon-code.module';
import { ApiKeyModule } from './api-key.module';
import { CustomersModule } from './customer.module';
import { ItemsModule } from './item.module';
import { CustomerCouponCodeModule } from './customer-coupon-code.module';
import { CouponItemModule } from './coupon-item.module';

@Global()
@Module({
  imports: [
    UserModule,
    OrganizationModule,
    CouponModule,
    CampaignModule,
    CouponCodeModule,
    ApiKeyModule,
    CustomersModule,
    ItemsModule,
    CustomerCouponCodeModule,
    CouponItemModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthorizationService],
  exports: [AuthService, AuthorizationService],
})
export class AuthModule {}
