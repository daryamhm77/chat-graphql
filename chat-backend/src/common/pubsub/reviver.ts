import { Types } from 'mongoose';

export const reviver = (key: string, value: unknown) => {
  const isISO8601Z =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
  if (typeof value === 'string' && isISO8601Z.test(value)) {
    const tempDateNumber = Date.parse(value);
    if (!Number.isNaN(tempDateNumber)) {
      return new Date(tempDateNumber);
    }
  }
  if (key === '_id' && typeof value === 'string') {
    return new Types.ObjectId(value);
  }
  return value;
};
