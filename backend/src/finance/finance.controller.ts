import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(userId, dto);
  }

  @Get()
  async findAll(
    @GetCurrentUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    return this.transactionsService.findAll(userId, page, limit, month, year);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.transactionsService.findOne(id, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.transactionsService.remove(id, userId);
  }
}
