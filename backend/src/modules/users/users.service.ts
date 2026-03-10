import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    return this.toSafeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const existingUser = await this.usersRepository.findOne({ where: { id } });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    const updatedUser = this.usersRepository.merge(existingUser, updateUserDto);
    const savedUser = await this.usersRepository.save(updatedUser);
    return this.toSafeUser(savedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} was not found`);
    }

    await this.usersRepository.remove(user);
  }

  private toSafeUser(user: User): SafeUser {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
