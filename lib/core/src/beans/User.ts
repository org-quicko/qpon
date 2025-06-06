import { Expose, Transform } from "class-transformer";
import { IsString, IsEnum, IsDate, IsUUID, IsOptional } from "class-validator";
import { Role } from "../enums";

export class User {
	@Expose({ name: "user_id" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsUUID()
	userId?: string;

	@IsString()
	name?: string;

	@IsString()
	email?: string;

	@IsString()
	password?: string;

	@IsOptional()
	@IsEnum(Role)
	role?: Role;

	@IsOptional()
	@Expose({ name: "last_accessed_at" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsDate()
	lastAccessedAt?: Date;

	@Expose({ name: "created_at" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsDate()
	createdAt?: Date;

	@Expose({ name: "updated_at" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsDate()
	updatedAt?: Date;

	getUserId(): string | undefined {
		return this.userId;
	}

  setUserId(userId: string): void {
    this.userId = userId;
  }

	getName(): string | undefined {
		return this.name;
	}

	setName(name: string): void {
		this.name = name;
	}

	getEmail(): string | undefined {
		return this.email;
	}

	setEmail(email: string): void {
		this.email = email;
	}

  getPassword(): string | undefined {
    return this.password;
  }

  setPassword(password: string): void {
    this.password = password;
  }

  getRole(): Role | undefined {
    return this.role;
  }

  setRole(role: Role): void {
    this.role = role;
  }
  
	getCreatedAt(): Date | undefined {
		return this.createdAt;
	}

	setCreatedAt(createdAt: Date): void {
		this.createdAt = createdAt;
	}

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}
