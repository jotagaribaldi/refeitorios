"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const uuid_1 = require("uuid");
const QRCode = __importStar(require("qrcode"));
const user_entity_1 = require("./user.entity");
const restaurant_entity_1 = require("../restaurants/restaurant.entity");
let UsersService = class UsersService {
    repo;
    restaurantRepo;
    constructor(repo, restaurantRepo) {
        this.repo = repo;
        this.restaurantRepo = restaurantRepo;
    }
    async findAll(tenantId) {
        const where = tenantId ? { tenantId } : {};
        const users = await this.repo.find({
            where,
            relations: ['tenant', 'allowedRestaurants'],
            order: { name: 'ASC' },
        });
        return users.map(({ passwordHash: _, ...u }) => u);
    }
    async findOne(id) {
        const user = await this.repo.findOne({
            where: { id },
            relations: ['tenant', 'allowedRestaurants'],
        });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const { passwordHash: _, ...result } = user;
        return result;
    }
    async create(dto, currentUser) {
        if (currentUser.role === user_entity_1.UserRole.GERENTE) {
            if (dto.role !== user_entity_1.UserRole.FUNCIONARIO && dto.role !== user_entity_1.UserRole.FISCAL) {
                throw new common_1.ForbiddenException('Gerente só pode criar funcionários ou fiscais');
            }
            dto.tenantId = currentUser.tenantId;
        }
        const exists = await this.repo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email já cadastrado');
        const { password, allowedRestaurantIds, ...rest } = dto;
        const passwordHash = await bcrypt.hash(password, 10);
        const qrCodeToken = (dto.role === user_entity_1.UserRole.FUNCIONARIO || dto.role === user_entity_1.UserRole.FISCAL)
            ? (0, uuid_1.v4)()
            : null;
        const user = this.repo.create({ ...rest, passwordHash, qrCodeToken });
        if (allowedRestaurantIds?.length && dto.role === user_entity_1.UserRole.FUNCIONARIO) {
            user.allowedRestaurants = await this.restaurantRepo.findBy({
                id: (0, typeorm_2.In)(allowedRestaurantIds),
            });
        }
        else {
            user.allowedRestaurants = [];
        }
        const saved = await this.repo.save(user);
        const { passwordHash: __, ...result } = saved;
        return result;
    }
    async update(id, dto, currentUser) {
        const user = await this.repo.findOne({
            where: { id },
            relations: ['allowedRestaurants'],
        });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (currentUser.role === user_entity_1.UserRole.GERENTE && user.tenantId !== currentUser.tenantId) {
            throw new common_1.ForbiddenException('Acesso negado');
        }
        if (currentUser.role === user_entity_1.UserRole.GERENTE && dto.role) {
            const allowedRoles = [user_entity_1.UserRole.FUNCIONARIO, user_entity_1.UserRole.FISCAL];
            const isSelfGerente = user.id === currentUser.id && dto.role === user_entity_1.UserRole.GERENTE;
            if (!allowedRoles.includes(dto.role) && !isSelfGerente) {
                throw new common_1.ForbiddenException('Gerente só pode gerenciar perfis de funcionários e fiscais');
            }
        }
        if (currentUser.role === user_entity_1.UserRole.GERENTE && dto.tenantId && dto.tenantId !== currentUser.tenantId) {
            throw new common_1.ForbiddenException('Gerente não pode alterar a empresa do usuário');
        }
        const { password, allowedRestaurantIds, ...rest } = dto;
        if (password) {
            rest.passwordHash = await bcrypt.hash(password, 10);
        }
        Object.assign(user, rest);
        if (allowedRestaurantIds !== undefined) {
            user.allowedRestaurants = allowedRestaurantIds.length
                ? await this.restaurantRepo.findBy({ id: (0, typeorm_2.In)(allowedRestaurantIds) })
                : [];
        }
        const saved = await this.repo.save(user);
        const { passwordHash: _, ...result } = saved;
        return result;
    }
    async remove(id) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.isActive = false;
        return this.repo.save(user);
    }
    async getAllowedRestaurantIds(userId) {
        const user = await this.repo.findOne({
            where: { id: userId },
            relations: ['allowedRestaurants'],
        });
        if (!user)
            return [];
        if (!user.allowedRestaurants?.length)
            return [];
        return user.allowedRestaurants.map((r) => r.id);
    }
    async getUserQrData(userId) {
        const user = await this.repo.findOne({
            where: { id: userId },
            relations: ['tenant'],
        });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (!user.qrCodeToken) {
            user.qrCodeToken = (0, uuid_1.v4)();
            await this.repo.save(user);
        }
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ userId: user.id, token: user.qrCodeToken }));
        return {
            userId: user.id,
            qrCodeToken: user.qrCodeToken,
            qrDataUrl,
            userName: user.name,
            employeeCode: user.employeeCode,
            tenantName: user.tenant?.name || '',
        };
    }
    async regenerateUserQr(userId) {
        const user = await this.repo.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.qrCodeToken = (0, uuid_1.v4)();
        await this.repo.save(user);
        return this.getUserQrData(userId);
    }
    async findByQrToken(token) {
        const user = await this.repo.findOne({
            where: { qrCodeToken: token, isActive: true },
            relations: ['tenant'],
        });
        if (!user)
            throw new common_1.NotFoundException('QR Code inválido');
        return user;
    }
    async findByQrTokenForFiscal(userId) {
        const user = await this.repo.findOne({
            where: { id: userId, isActive: true },
            relations: ['tenant'],
        });
        if (!user)
            throw new common_1.NotFoundException('Funcionário não encontrado');
        if (!user.qrCodeToken) {
            throw new common_1.NotFoundException('Funcionário não possui QR Code');
        }
        return user;
    }
    async seedRoot() {
        const exists = await this.repo.findOne({ where: { email: 'root@refeitorios.com' } });
        if (exists)
            return;
        const passwordHash = await bcrypt.hash('root@123', 10);
        await this.repo.save(this.repo.create({
            name: 'Super Admin',
            email: 'root@refeitorios.com',
            passwordHash,
            role: user_entity_1.UserRole.ROOT,
        }));
        console.log('✅ ROOT user seeded: root@refeitorios.com / root@123');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(restaurant_entity_1.Restaurant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map