import dayjs from 'dayjs';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Controller } from 'react-hook-form';
// Date-picker
export default function Datepicker({ name, control, isMulti, rules, key }) {
  return (
    <Controller
      key={key}
      name={name}
      control={control}
      render={({ field }) => (
        <DatePicker
          className="form-control  "
          selected={field.value}
          onChange={(date) => field.onChange(date)}
        />
      )}
    />
  );
}
