import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';

@Controller('workout-plans')
@UseGuards(AuthGuard('jwt'))
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.create(userId, dto);
  }

  @Get()
  async findAll(
    @GetCurrentUserId() userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.workoutPlansService.findAll(userId, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.workoutPlansService.findOne(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.workoutPlansService.remove(id, userId);
  }

  // ==========================================
  // ENDPOINTS DE EXERCÍCIOS VINCULADOS
  // ==========================================

  @Post(':planId/exercises')
  @HttpCode(HttpStatus.CREATED)
  async addExercise(
    @Param('planId') planId: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.workoutPlansService.addExercise(planId, userId, dto);
  }

  @Delete(':planId/exercises/:exerciseId')
  @HttpCode(HttpStatus.OK)
  async removeExercise(
    @Param('planId') planId: string,
    @Param('exerciseId') exerciseId: string,
    @GetCurrentUserId() userId: string,
  ) {
    return this.workoutPlansService.removeExercise(planId, exerciseId, userId);
  }
}
