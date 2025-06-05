import { Badge, Button, Card, CardBody, Progress } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Clock, Phone, UserCheck, X } from "lucide-react";

interface HumanHandoffIndicatorProps {
  isWaiting: boolean;
  isConnected: boolean;
  adminName?: string;
  timeoutRemaining: number;
  onEndHandoff: () => void;
}

export default function HumanHandoffIndicator({
  isWaiting,
  isConnected,
  adminName,
  timeoutRemaining,
  onEndHandoff,
}: HumanHandoffIndicatorProps) {
  if (!isWaiting && !isConnected) {
    return null;
  }

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getProgressValue = (): number => {
    if (!isWaiting) return 100;
    return ((60000 - timeoutRemaining) / 60000) * 100;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-4"
      >
        {isWaiting && (
          <Card className="border-l-4 border-l-warning bg-gradient-to-r from-warning-50 to-orange-50 shadow-lg">
            <CardBody className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Clock className="size-5 text-warning-600" />
                    </motion.div>
                    <div>
                      <span className="font-semibold text-warning-700">
                        Đang tìm cán bộ tư vấn...
                      </span>
                      <p className="text-sm text-warning-600">
                        Vui lòng chờ trong giây lát
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Badge color="warning" variant="flat" size="lg">
                      {formatTime(timeoutRemaining)}
                    </Badge>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian chờ</span>
                    <span className="font-medium text-warning-700">
                      {formatTime(timeoutRemaining)} / 60s
                    </span>
                  </div>
                  <Progress
                    value={getProgressValue()}
                    color="warning"
                    size="md"
                    className="w-full"
                    classNames={{
                      indicator: "bg-gradient-to-r from-warning-400 to-orange-400",
                    }}
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-lg bg-warning-100/50 p-3 text-sm text-warning-700"
                >
                  <div className="flex items-start gap-2">
                    <Clock className="size-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Đang tìm kiếm:</strong> Hệ thống đang kết nối bạn với
                      cán bộ tư vấn có sẵn. Nếu không có phản hồi trong{" "}
                      <span className="font-semibold">
                        {formatTime(timeoutRemaining)}
                      </span>
                      , bot sẽ tiếp tục hỗ trợ bạn.
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardBody>
          </Card>
        )}

        {isConnected && (
          <Card className="border-l-4 border-l-success bg-gradient-to-r from-success-50 to-emerald-50 shadow-lg">
            <CardBody className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="size-5 text-success-600" />
                    </motion.div>
                    <div>
                      <span className="font-semibold text-success-700">
                        ✅ Đã kết nối thành công!
                      </span>
                      <p className="text-sm text-success-600">
                        Bạn đang được hỗ trợ trực tiếp
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<X size={14} />}
                    onClick={onEndHandoff}
                    className="hover:bg-danger-100"
                  >
                    Kết thúc
                  </Button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 rounded-lg bg-success-100/60 p-3"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-4 text-success-600" />
                    <span className="font-medium text-success-700">
                      {adminName || "Cán bộ tư vấn"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="size-2 rounded-full bg-success-500"
                    />
                    <Badge color="success" size="sm" variant="flat">
                      Đang online
                    </Badge>
                  </div>
                  <Phone className="size-4 text-success-600" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="rounded-lg bg-success-100/40 p-3 text-sm text-success-700"
                >
                  <div className="flex items-start gap-2">
                    <UserCheck className="size-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Hỗ trợ trực tiếp:</strong> Bạn đang trò chuyện trực tiếp
                      với cán bộ tư vấn. Họ sẽ giải đáp mọi thắc mắc và cung cấp
                      thông tin chi tiết cho bạn.
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardBody>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
