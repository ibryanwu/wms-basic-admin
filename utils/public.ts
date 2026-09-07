import { v4 as uuidv4 } from 'uuid'; // 引入UUID生成函数
import crypto from 'crypto'; // 引入crypto库
import { ToastOptions } from 'react-toastify';
// 导入 Day.js 和插件
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// 加载插件
dayjs.extend(utc);
dayjs.extend(timezone);

export function cleanObject(obj: any) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null && value !== '',
    ),
  );
}
export const generateShortUUID = () => {
  const newUUID = uuidv4(); // 生成UUID
  const md5Hash = crypto.createHash('md5'); // 使用MD5散列算法
  md5Hash.update(newUUID); // 更新散列的内容
  const hashedValue = md5Hash.digest('hex'); // 计算散列值
  return hashedValue;
};

export const getShortUUIDLast6 = () => {
  return generateShortUUID().slice(-6);
};

export const getCreateOrderPath = (orderType: 'inbound' | 'outbound') =>
  `/${orderType}/create?t=${Date.now()}`;

// 将数字格式化为货币字符串
export function convertPrice(amount: number | string) {
  // 如果 amount 是字符串，尝试将其解析为数字
  if (typeof amount === 'string') {
    amount = parseFloat(parseFloat(amount).toFixed(2));
  } else if (typeof amount === 'number') {
    amount = parseFloat(amount.toFixed(2));
  } else {
    amount = -9999.99;
  }

  // 检查是否成功解析为数字
  if (isNaN(amount)) {
    throw new Error('Invalid amount');
  }

  // 使用 toFixed 方法来保留两位小数
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return formattedAmount;
}

export const toastOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

// 从环境变量中读取本地时区
const LOCAL_TIMEZONE =
  process.env.NEXT_PUBLIC_LOCAL_TIMEZONE || 'America/Toronto';

/**
 * 将服务器 UTC 时间转换为本地时区时间
 * @param {string} utcTime - 服务器 UTC 时间字符串 (e.g., "2025-01-13T11:16:25.374Z")
 * @param {string} format - 输出日期时间格式 (默认: "YYYY-MM-DD HH:mm:ss")
 * @returns {string} 本地时区时间字符串
 */
export function serverToLocal(utcTime: string, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!utcTime) {
    throw new Error('UTC 时间是必需的参数');
  }
  // 确保时间转换逻辑正确
  const localTime = dayjs.utc(utcTime).tz(LOCAL_TIMEZONE).format(format);

  
  return localTime;
}

/**
 * 将本地时区时间转换为服务器 UTC 时间
 * @param {string} localTime - 本地时区时间字符串 (e.g., "2025-01-13 06:16:25")
 * @param {string} format - 输出日期时间格式 (默认: "YYYY-MM-DD HH:mm:ss")
 * @returns {string} 服务器 UTC 时间字符串
 */
export function localToServer(
  localTime: string,
  format = 'YYYY-MM-DD HH:mm:ss',
) {
  if (!localTime) {
    throw new Error('本地时间是必需的参数');
  }
  return dayjs.tz(localTime, LOCAL_TIMEZONE).utc().format(format);
}
