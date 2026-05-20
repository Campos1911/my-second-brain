import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesService } from '../categories/categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.create(userId, dto);
  }

  @Get()
  async findAll(@GetCurrentUserId() userId: string) {
    return this.categoriesService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.categoriesService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, userId, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.categoriesService.remove(id, userId);
  }
}
