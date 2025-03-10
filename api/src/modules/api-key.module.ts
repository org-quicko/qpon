import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKeyConverter } from '../converters/api-key.converter';
import { ApiKeyController } from '../controllers/api-key.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApiKey])],
  controllers: [ApiKeyController],
  providers: [ApiKeyService, ApiKeyConverter],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
