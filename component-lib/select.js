import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
const SelectPro = (props) => {
  const {
    name,
    control,
    options,
    defaultValue,
    isMulti,
    rules,
    key,
    filterOption,
    isDisabled,
    onChangeHandler,
    handleMenuOpen,
  } = props;
  return (
    <div>
      <Controller
        key={key}
        name={name}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <Select
            className=""
            value={field.value}
            // rules={{ required: 'Username is required' }}
            // onChange={(value) => field.onChange(value)}
            onChange={(value) => {
              if (onChangeHandler) {
                onChangeHandler(value);
              }
              field.onChange(value);
            }}
            options={options}
            isMulti={isMulti}
            rules={rules}
            filterOption={filterOption}
            isDisabled={isDisabled ? isDisabled : false}
            menuPlacement="auto"
            onMenuOpen={handleMenuOpen}
          />
        )}
      />
    </div>
  );
};

export default SelectPro;
