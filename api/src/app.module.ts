import { UserModule } from './modules/user.module';
import { CustomersModule } from './modules/customers.module';
import { ItemsModule } from './modules/items.module';
import { RedemptionsModule } from './modules/redemptions.module';
import { OffersModule } from './modules/offers.module';
import { CouponCodeModule } from './modules/coupon-code.module';
import { CampaignModule } from './modules/campaign.module';
import { CouponModule } from './modules/coupon.module';
import { OrganizationModule } from './modules/organization.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './modules/logger.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    LoggerModule,
    OrganizationModule,
    CouponModule,
    CampaignModule,
    CouponCodeModule,
    OffersModule,
    RedemptionsModule,
    ItemsModule,
    CustomersModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
