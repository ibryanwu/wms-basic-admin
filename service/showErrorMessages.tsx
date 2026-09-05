import { toastOptions } from '@/utils/public';
import { toast } from 'react-toastify';

export function showErrorMessages(messages: string[]) {
  if (messages.length > 0) {
    toast.error(
      <div>
        Input Error:<br></br>
        {messages.map((message, index) => (
          <div key={index}>
            {index + 1}- {message}
          </div>
        ))}
      </div>,
      toastOptions,
    );
  }
}
