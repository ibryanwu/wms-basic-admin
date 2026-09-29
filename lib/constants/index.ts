export const TOKEN = 'token';
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_PERMISSIONS = 'auth_permissions';
export const LIMIT = 10;
export const ROLE_SUPER_ADMIN = 'SUPER';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_USER = 'USER';
export const STORE_INFO = 'store_info';
export const USER_ROLES_STORAGE_KEY = 'user_roles';
export const USER_INFO_STORAGE_KEY = 'user_info';

/** Backend RESULT_CODE */
export const RESULT_CODE = {
  SUCCESS: 0,
  DATA_ALREADY_EXISTED: 5003,
} as const;

//RegEx
export const DECIMAL_GREATER_THAN_0 = /^(?!0*(\.0+)?$)\d+(\.\d+)?$/;
export const INT_GREATER_THAN_0 = /^(?!0$)([1-9]\d*)$/;
export const DECIMAL_GREATER_THAN_0_NULLABLE = /^(?:\d+|\d*\.\d+)?$/;
export const DECIMAL_GREATER_EQUAL_0_NULLABLE = /^(?:0|[1-9]\d*|\d*\.\d+)?$/; //数字或小数，包括空字符串,不能为负数
export const DECIMAL_OR_0 = /^(?:[1-9]\d*|0|\d*\.\d+)$/;
export const STRING_CONSISTS_BY_NUMERIC = /^[1-9]\d*$/; //大于0的整数数字，不能已0开头
export const NUMERIC_GREATER_OR_LESS_0 = /^-?[1-9]\d*(\.\d+)?$/; //可正可负的小数，不能等于0
