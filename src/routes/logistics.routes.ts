import { Role } from '@prisma/client';
import { Router, type RequestHandler } from 'express';
import type { LogisticsController } from '../controllers/logistics.controller';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { acceptJobSchema, createVehicleSchema, deliverySchema, jobSchema, listJobsSchema, listVehiclesSchema, manualAssignmentSchema, rejectJobSchema, scheduleDeliverySchema, transitionDeliverySchema, updateVehicleSchema, vehicleSchema } from '../validators/logistics.validators';

export function createLogisticsRouter(controller: LogisticsController, authenticate: RequestHandler): Router {
  const router = Router();
  router.get('/transport-jobs', authenticate, authorizeRoles(Role.TRANSPORTER, Role.ADMIN), validateRequest(listJobsSchema), controller.listJobs);
  router.get('/transport-jobs/:jobId', authenticate, authorizeRoles(Role.TRANSPORTER, Role.ADMIN), validateRequest(jobSchema), controller.getJob);
  router.post('/transport-jobs/:jobId/assign/automatic', authenticate, authorizeRoles(Role.ADMIN), validateRequest(jobSchema), controller.automaticAssign);
  router.post('/transport-jobs/:jobId/assign/manual', authenticate, authorizeRoles(Role.ADMIN), validateRequest(manualAssignmentSchema), controller.manualAssign);
  router.post('/transport-jobs/:jobId/reassign', authenticate, authorizeRoles(Role.ADMIN), validateRequest(manualAssignmentSchema), controller.manualAssign);
  router.post('/transport-jobs/:jobId/accept', authenticate, authorizeRoles(Role.TRANSPORTER), validateRequest(acceptJobSchema), controller.accept);
  router.post('/transport-jobs/:jobId/reject', authenticate, authorizeRoles(Role.TRANSPORTER), validateRequest(rejectJobSchema), controller.reject);
  router.get('/deliveries', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(listJobsSchema), controller.listDeliveries);
  router.get('/deliveries/:deliveryId', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(deliverySchema), controller.getDelivery);
  router.post('/deliveries/:deliveryId/schedule', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(scheduleDeliverySchema), controller.schedule);
  router.post('/deliveries/:deliveryId/transitions', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(transitionDeliverySchema), controller.transition);
  router.get('/vehicles', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(listVehiclesSchema), controller.listVehicles);
  router.get('/vehicles/:vehicleId', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(vehicleSchema), controller.getVehicle);
  router.post('/vehicles', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(createVehicleSchema), controller.createVehicle);
  router.patch('/vehicles/:vehicleId', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(updateVehicleSchema), controller.updateVehicle);
  router.delete('/vehicles/:vehicleId', authenticate, authorizeRoles(Role.BUYER, Role.FARMER, Role.TRANSPORTER, Role.ADMIN), validateRequest(vehicleSchema), controller.deleteVehicle);
  return router;
}
