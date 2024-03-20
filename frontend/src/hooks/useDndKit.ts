import {
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensors,
} from "@dnd-kit/core";

const activationConstraint = {
  delay: 0,
  tolerance: 5,
};

export const useDndKit = () => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint,
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint,
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  return sensors;
};
