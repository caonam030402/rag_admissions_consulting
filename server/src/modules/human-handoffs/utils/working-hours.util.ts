import type { WorkingDaysConfig } from '../../chatbots/domain/chatbot-config';

export interface WorkingHoursChecker {
  isWorkingTime(
    timezone: string,
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): boolean;
  getNextWorkingTime(
    timezone: string,
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): Date | null;
  formatWorkingSchedule(
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): string;
}

export class WorkingHoursUtil implements WorkingHoursChecker {
  private readonly dayMapping = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  /**
   * Kiểm tra xem hiện tại có phải trong giờ làm việc không
   */
  isWorkingTime(
    timezone: string,
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): boolean {
    try {
      const now = new Date();
      const localTime = new Date(
        now.toLocaleString('en-US', { timeZone: timezone }),
      );

      const currentDay = this.dayMapping[localTime.getDay()];
      const currentTime = `${localTime.getHours().toString().padStart(2, '0')}:${localTime.getMinutes().toString().padStart(2, '0')}`;

      // Kiểm tra có phải ngày làm việc không
      if (!workingDays.includes(currentDay)) {
        return false;
      }

      // Kiểm tra giờ làm việc
      const dayHours = workingHours[currentDay as keyof WorkingDaysConfig];
      if (!dayHours) {
        return false;
      }

      return currentTime >= dayHours.start && currentTime <= dayHours.end;
    } catch (error) {
      console.error('Error checking working time:', error);
      return false;
    }
  }

  /**
   * Tìm thời gian làm việc tiếp theo
   */
  getNextWorkingTime(
    timezone: string,
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): Date | null {
    try {
      const now = new Date();
      const localTime = new Date(
        now.toLocaleString('en-US', { timeZone: timezone }),
      );

      // Tìm ngày làm việc tiếp theo (tối đa 7 ngày)
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(localTime);
        checkDate.setDate(checkDate.getDate() + i);

        const dayName = this.dayMapping[checkDate.getDay()];

        if (workingDays.includes(dayName)) {
          const dayHours = workingHours[dayName as keyof WorkingDaysConfig];
          if (dayHours) {
            const [startHour, startMinute] = dayHours.start
              .split(':')
              .map(Number);

            const nextWorkingTime = new Date(checkDate);
            nextWorkingTime.setHours(startHour, startMinute, 0, 0);

            // Nếu là hôm nay và vẫn còn thời gian làm việc
            if (i === 0) {
              const [endHour, endMinute] = dayHours.end.split(':').map(Number);
              const endTime = new Date(checkDate);
              endTime.setHours(endHour, endMinute, 0, 0);

              if (now < endTime) {
                return nextWorkingTime > now ? nextWorkingTime : now;
              }
            } else {
              return nextWorkingTime;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting next working time:', error);
      return null;
    }
  }

  /**
   * Format lịch làm việc thành string dễ đọc
   */
  formatWorkingSchedule(
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): string {
    const schedule: string[] = [];

    workingDays.forEach((day) => {
      const dayHours = workingHours[day as keyof WorkingDaysConfig];
      if (dayHours) {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        schedule.push(`${dayName}: ${dayHours.start} - ${dayHours.end}`);
      }
    });

    return schedule.join(', ');
  }

  /**
   * Validate working hours configuration
   */
  validateWorkingHours(
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Kiểm tra có ít nhất 1 ngày làm việc
    if (!workingDays || workingDays.length === 0) {
      errors.push('At least one working day must be selected');
    }

    // Kiểm tra từng ngày làm việc phải có giờ làm việc
    workingDays.forEach((day) => {
      const dayHours = workingHours[day as keyof WorkingDaysConfig];
      if (!dayHours) {
        errors.push(`Working hours not configured for ${day}`);
        return;
      }

      // Kiểm tra format giờ
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(dayHours.start)) {
        errors.push(`Invalid start time format for ${day}: ${dayHours.start}`);
      }
      if (!timeRegex.test(dayHours.end)) {
        errors.push(`Invalid end time format for ${day}: ${dayHours.end}`);
      }

      // Kiểm tra start time phải nhỏ hơn end time
      if (dayHours.start >= dayHours.end) {
        errors.push(`Start time must be before end time for ${day}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Parse timezone string (support both standard and custom formats)
   */
  parseTimezone(timezoneString: string): string {
    // Handle formats like "Asia/Ho_Chi_Minh" hoặc "Asia/Kolkata+05:30"
    if (timezoneString.includes('+') || timezoneString.includes('-')) {
      return timezoneString.split(/[+-]/)[0];
    }
    return timezoneString;
  }

  /**
   * Get formatted handoff message for outside working hours
   */
  getOutsideWorkingHoursMessage(
    timezone: string,
    workingDays: string[],
    workingHours: WorkingDaysConfig,
  ): string {
    const nextWorkingTime = this.getNextWorkingTime(
      timezone,
      workingDays,
      workingHours,
    );

    if (nextWorkingTime) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const isTomorrow =
        nextWorkingTime.getDate() === tomorrow.getDate() &&
        nextWorkingTime.getMonth() === tomorrow.getMonth() &&
        nextWorkingTime.getFullYear() === tomorrow.getFullYear();

      if (isTomorrow) {
        const timeOnly = nextWorkingTime.toLocaleTimeString('vi-VN', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
        });
        return `Hiện tại đang ngoài giờ làm việc. Ngày mai bắt đầu lúc ${timeOnly}`;
      }

      const nextWorkingFormatted = nextWorkingTime.toLocaleString('vi-VN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      });
      return `Hiện tại đang ngoài giờ làm việc. Thời gian làm việc tiếp theo: ${nextWorkingFormatted}`;
    }

    return 'Hiện tại đang ngoài giờ làm việc. Vui lòng liên hệ lại vào giờ làm việc.';
  }
}
