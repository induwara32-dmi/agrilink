import type { Request, RequestHandler } from 'express';
import { HTTP_STATUS } from '../constants/application';
import type { LogisticsService } from '../services/logistics.service';
import type { AssignmentInput, DeliveryTransitionInput, LogisticsActor, ScheduleInput, VehicleInput, VehicleUpdateInput } from '../types/logistics';
import type { AcceptJobBody, CreateVehicleBody, ManualAssignmentBody, RejectJobBody, ScheduleDeliveryBody, TransitionDeliveryBody, UpdateVehicleBody } from '../validators/logistics.validators';
import { asyncHandler } from '../utils/async-handler';
import { sendSuccess } from '../utils/response';
import { BaseController } from './base.controller';

const actorFrom = (request: Request): LogisticsActor => ({ userId: request.auth!.userId, role: request.auth!.role, requestId: request.requestId });
const parameter = (request: Request, name: string): string => { const value = request.params[name]; return Array.isArray(value) ? value[0]! : value!; };
const pageQuery = (request: Request) => ({ page: Number(request.query.page), pageSize: Number(request.query.pageSize) });

export class LogisticsController extends BaseController {
  public constructor(private readonly service: LogisticsService) { super(); }
  public readonly listJobs: RequestHandler = asyncHandler(async (request, response) => { const result = await this.service.listJobs(pageQuery(request), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly getJob: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getJob(parameter(request, 'jobId'), actorFrom(request))));
  public readonly automaticAssign: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.automaticAssign(parameter(request, 'jobId'), actorFrom(request))));
  public readonly manualAssign: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.manualAssign(parameter(request, 'jobId'), request.body as ManualAssignmentBody as AssignmentInput, actorFrom(request))));
  public readonly accept: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.accept(parameter(request, 'jobId'), (request.body as AcceptJobBody).vehicleId, actorFrom(request))));
  public readonly reject: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.reject(parameter(request, 'jobId'), (request.body as RejectJobBody).reason, actorFrom(request))));
  public readonly listDeliveries: RequestHandler = asyncHandler(async (request, response) => { const result = await this.service.listDeliveries(pageQuery(request), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly getDelivery: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getDelivery(parameter(request, 'deliveryId'), actorFrom(request))));
  public readonly schedule: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.schedule(parameter(request, 'deliveryId'), request.body as ScheduleDeliveryBody as ScheduleInput, actorFrom(request))));
  public readonly transition: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.transition(parameter(request, 'deliveryId'), request.body as TransitionDeliveryBody as DeliveryTransitionInput, actorFrom(request))));
  public readonly listVehicles: RequestHandler = asyncHandler(async (request, response) => { const result = await this.service.listVehicles(pageQuery(request), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, result.items, result.meta); });
  public readonly getVehicle: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.getVehicle(parameter(request, 'vehicleId'), actorFrom(request))));
  public readonly createVehicle: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.CREATED, await this.service.createVehicle(request.body as CreateVehicleBody as VehicleInput, actorFrom(request))));
  public readonly updateVehicle: RequestHandler = asyncHandler(async (request, response) => sendSuccess(response, HTTP_STATUS.OK, await this.service.updateVehicle(parameter(request, 'vehicleId'), request.body as UpdateVehicleBody as VehicleUpdateInput, actorFrom(request))));
  public readonly deleteVehicle: RequestHandler = asyncHandler(async (request, response) => { await this.service.deleteVehicle(parameter(request, 'vehicleId'), actorFrom(request)); return sendSuccess(response, HTTP_STATUS.OK, { message: 'Vehicle archived.' }); });
}
