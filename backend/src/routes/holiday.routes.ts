import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createHolidaySchema, updateHolidaySchema } from '../validators/holiday.validator.js';
import { createHoliday, listHolidays, getHoliday, updateHoliday, deleteHoliday, upcomingHolidays, calendarHolidays, holidayReports } from '../controllers/holiday.controller.js';

const router = Router();

router.use(authenticate);
router.get('/upcoming', upcomingHolidays);
router.get('/calendar', calendarHolidays);
router.get('/reports', holidayReports);
router.get('/', listHolidays);
router.post('/', validate(createHolidaySchema), createHoliday);
router.get('/:id', getHoliday);
router.put('/:id', validate(updateHolidaySchema), updateHoliday);
router.delete('/:id', deleteHoliday);

export default router;
