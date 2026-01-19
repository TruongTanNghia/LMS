import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, Role } from '../../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<{ user: any; token: string }> {
        const { email, password, fullName, role, unitId } = registerDto;

        // Check if user exists
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await this.userModel.create({
            email,
            password: hashedPassword,
            fullName,
            role: role || Role.STUDENT,
            unitId,
            trustScore: 100,
        });

        // Generate token
        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            token,
        };
    }

    async login(loginDto: LoginDto): Promise<{ user: any; token: string }> {
        const { email, password } = loginDto;

        // Find user
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = this.generateToken(user);

        return {
            user: this.sanitizeUser(user),
            token,
        };
    }

    async validateUser(userId: string): Promise<UserDocument | null> {
        return this.userModel.findById(userId);
    }

    private generateToken(user: UserDocument): string {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }

    private sanitizeUser(user: UserDocument): any {
        const { password, ...result } = user.toObject();
        return result;
    }
}
