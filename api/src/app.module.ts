import { UserModule } from './modules/user.module';
import { CustomersModule } from './modules/customer.module';
import { ItemsModule } from './modules/item.module';
import { RedemptionsModule } from './modules/redemption.module';
import { OffersModule } from './modules/offer.module';
import { CouponCodeModule } from './modules/coupon-code.module';
import { CampaignModule } from './modules/campaign.module';
import { CouponModule } from './modules/coupon.module';
import { OrganizationModule } from './modules/organization.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './modules/logger.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { AuthModule } from './modules/auth.module';
import { CouponItemModule } from './modules/coupon-item.module';
import { CustomerCouponCodeModule } from './modules/customer-coupon-code.module';
import { ApiKeyModule } from './modules/api-key.module';
import { RedemptionSubscriber } from './subscribers/redemption.subscriber';
import { CampaignSubscriber } from './subscribers/campaign.subscriber';
import { CouponSubscriber } from './subscribers/coupon.subscriber';
import { OrganizationSubscriber } from './subscribers/organization.subscriber';
import { PermissionGuard } from './guards/permission.guard';
import { CouponCodeSubscriber } from './subscribers/coupon-code.subscriber';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { typeOrmConfig } from './config/typeorm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...typeOrmConfig(configService),
        subscribers: [
          RedemptionSubscriber,
          CampaignSubscriber,
          CouponSubscriber,
          OrganizationSubscriber,
          CouponCodeSubscriber,
        ],
      }),
    }),
    LoggerModule,
    ApiKeyModule,
    AuthModule,
    OrganizationModule,
    CouponModule,
    CampaignModule,
    CouponCodeModule,
    OffersModule,
    RedemptionsModule,
    ItemsModule,
    CustomersModule,
    UserModule,
    CouponItemModule,
    CustomerCouponCodeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
