import React from 'react';
import { Stack, Button, Input } from '@mui/joy';

const NumericInputPad = ({
  setInputValue,
  value,
  setInputPad,
}: {
  setInputValue: any; //设置input值的方法 使用 useState
  value: string; // input的值
  setInputPad: any; // 方法 当前inputPad 名称 默认为''
}) => {
  // Function to handle button click and set the value to the input
  const handleButtonClick = (val: number) => {
    const str = value + val.toString();
    setInputValue(str.replace(/^0(?=\D*\d)/, '')); //// 使用正则表达式匹配第一个数字前的 0
  };

  return (
    <div
      style={{
        backgroundColor: '#e7b555',
        marginTop: '4px',
        borderRadius: '6px',
      }}
    >
      <Stack
        spacing={2}
        alignItems="center"
        justifyContent="center"
        direction="column"
        sx={{ width: '100%', marginTop: '6px', marginBottom: '6px' }}
      >
        {/* Buttons */}
        <Stack
          gap={0.5}
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <Button
              key={num}
              variant="outlined"
              onClick={() => handleButtonClick(num)}
              sx={{
                width: '14px',
                minHeight: '20px',
                backgroundColor: '#edf2fa',
                color: 'black',
              }}
            >
              {num}
            </Button>
          ))}
          <Stack direction="row" gap={0.5}>
            <Button
              variant="outlined"
              onClick={() => setInputValue('')}
              sx={{
                width: '14px',
                minHeight: '20px',
                backgroundColor: '#edf2fa',
                color: 'black',
              }}
            >
              C
            </Button>
            <Button
              variant="outlined"
              onClick={() => setInputPad('')}
              sx={{
                width: '14px',
                minHeight: '20px',
                backgroundColor: '#edf2fa',
                color: 'black',
              }}
            >
              X
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default NumericInputPad;
