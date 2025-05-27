import React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import Input from "@/components/common/Input";
import { cn } from "@/libs/utils";
import type { HumanHandoffFormValues } from "@/validations/humanHandoffValidation";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface WorkingHoursSelectorProps {
  disabled?: boolean;
}

export default function WorkingHoursSelector({
  disabled,
}: WorkingHoursSelectorProps) {
  const { control } = useFormContext<HumanHandoffFormValues>();
  const workingDays = useWatch({ control, name: "workingDays" });
  const workingHours = useWatch({ control, name: "workingHours" });

  // Tính toán số giờ giữa 2 thời điểm
  const calculateHours = (from: string, to: string): number => {
    if (!from || !to) return 0;

    const [fromHours, fromMinutes] = from.split(":").map(Number);
    const [toHours, toMinutes] = to.split(":").map(Number);

    let hours = toHours - fromHours;
    let minutes = toMinutes - fromMinutes;

    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }

    return parseFloat((hours + minutes / 60).toFixed(1));
  };

  return (
    <div className="my-4">
      <div className={cn("space-y-3", disabled && "text-gray-500")}>
        {days.map((day, index) => (
          <div key={day} className="flex items-center gap-3">
            <div className="w-24 text-sm">{day}</div>

            <Controller
              name={`workingHours.${index}.from`}
              control={control}
              render={({ field }) => (
                <Input
                  type="time"
                  className="max-w-24"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!workingDays[index] || disabled}
                />
              )}
            />

            <span className="mx-2">to</span>

            <Controller
              name={`workingHours.${index}.to`}
              control={control}
              render={({ field }) => (
                <Input
                  type="time"
                  className="max-w-24"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!workingDays[index] || disabled}
                />
              )}
            />

            {workingDays[index] && workingHours && workingHours[index] && (
              <div className="ml-4 text-sm text-gray-500">
                {calculateHours(
                  workingHours[index].from,
                  workingHours[index].to,
                )}{" "}
                hrs
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
