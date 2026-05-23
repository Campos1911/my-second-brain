import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkoutSessionsService } from './workout-sessions.service';
import { StartSessionDto } from './dto/start-session.dto';
import { LogSetDto } from './dto/log-set.dto';
import { UpdateSetLogDto } from './dto/update-set-log.dto';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

@Controller('workout-sessions')
@UseGuards(AuthGuard('jwt'))
export class WorkoutSessionsController {
  constructor(
    private readonly workoutSessionsService: WorkoutSessionsService,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startSession(
    @GetCurrentUserId() userId: string,
    @Body() dto: StartSessionDto,
  ) {
    return this.workoutSessionsService.startSession(userId, dto);
  }

  @Post(':id/sets')
  @HttpCode(HttpStatus.CREATED)
  async logSet(
    @Param('id') sessionId: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: LogSetDto,
  ) {
    return this.workoutSessionsService.logSet(sessionId, userId, dto);
  }

  @Post(':id/finish')
  @HttpCode(HttpStatus.OK)
  async finishSession(
    @Param('id') sessionId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.workoutSessionsService.finishSession(sessionId, userId);
  }

  @Patch('sets/:setId')
  async updateSet(
    @Param('setId') setId: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateSetLogDto,
  ) {
    return this.workoutSessionsService.updateSet(setId, userId, dto);
  }

  @Delete('sets/:setId')
  @HttpCode(HttpStatus.OK)
  async removeSet(
    @Param('setId') setId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.workoutSessionsService.removeSet(setId, userId);
  }

  @Get('exercises/:exerciseId/progress')
  async getExerciseProgress(
    @Param('exerciseId') exerciseId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.workoutSessionsService.getExerciseProgress(exerciseId, userId);
  }

  @Get()
  async findAll(
    @GetCurrentUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.workoutSessionsService.findAll(userId, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.workoutSessionsService.findOne(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.workoutSessionsService.remove(id, userId);
  }
}
