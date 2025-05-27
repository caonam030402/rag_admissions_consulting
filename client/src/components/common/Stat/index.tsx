import { Card, CardBody } from "@heroui/card";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import React from "react";

interface StatProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

const Stat: React.FC<StatProps> = ({ title, value, change, icon }) => {
  const isPositive = change && change > 0;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardBody className="p-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="shrink-0 rounded-full bg-primary-50 p-3 text-primary-600">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <p className="mb-1 text-sm font-medium text-gray-500">{title}</p>
            <h3 className="mb-1 text-2xl font-bold">{value}</h3>
            {change !== undefined && (
              <div
                className={`inline-flex items-center text-xs font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="mr-1">
                  {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </span>
                <span>
                  {Math.abs(change).toFixed(1)}%{" "}
                  {isPositive ? "increase" : "decrease"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Stat;
