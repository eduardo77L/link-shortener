import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Link } from './link.entity';

export type LinkResponse = {
  code: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
  expiresAt: Date;
};

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linksRepository: Repository<Link>,
    private readonly configService: ConfigService,
  ) {}

  async create(originalUrl: string): Promise<LinkResponse> {
    const normalizedUrl = this.normalizeUrl(originalUrl);
    const code = await this.generateUniqueCode();
    const expiresAt = this.getExpiryDate();

    const link = this.linksRepository.create({
      code,
      originalUrl: normalizedUrl,
      expiresAt,
    });

    const saved = await this.linksRepository.save(link);
    return this.toResponse(saved);
  }

  async findAll(): Promise<LinkResponse[]> {
    const links = await this.linksRepository.find({
      where: { expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });

    return links.map((link) => this.toResponse(link));
  }

  async findByCode(code: string): Promise<Link> {
    const link = await this.linksRepository.findOne({ where: { code } });

    if (!link) {
      throw new NotFoundException('Link not found');
    }

    if (link.expiresAt <= new Date()) {
      throw new NotFoundException('Link expired');
    }

    return link;
  }

  private getExpiryDate(): Date {
    const expiryDays =
      Number(this.configService.get('LINK_EXPIRY_DAYS', 7)) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    return expiresAt;
  }

  private normalizeUrl(url: string): string {
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }

  private async generateUniqueCode(): Promise<string> {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let attempt = 0; attempt < 10; attempt++) {
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      const exists = await this.linksRepository.exists({ where: { code } });
      if (!exists) {
        return code;
      }
    }

    throw new ConflictException('Could not generate a unique code');
  }

  private toResponse(link: Link): LinkResponse {
    const baseUrl = this.configService.get(
      'APP_URL',
      'http://localhost:3000/api',
    );

    return {
      code: link.code,
      originalUrl: link.originalUrl,
      shortUrl: `${baseUrl.replace(/\/$/, '')}/r/${link.code}`,
      createdAt: link.createdAt,
      expiresAt: link.expiresAt,
    };
  }
}
