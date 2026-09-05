import {
  AUTH_TOKEN_KEY,
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
  ROLE_USER,
} from './constants';
import Cookies from 'js-cookie';
import { isEmpty } from 'lodash';

export function checkIsLoggedIn() {
  const token = Cookies.get(AUTH_TOKEN_KEY);
  return !isEmpty(token);
}

function checkAuth(props: any): any {
  const checkToken = checkIsLoggedIn();

  if (!checkToken) {
    props.navigate('/login');
    return { code: -1, msg: 'no token!' };
  } else {
    if (props.userRolesLocal?.length === 0) {
      props.navigate('/login'); //no userRoles
      return { code: -2, msg: 'no userRoles' };
    }

    if (props.userRolesLocal.includes(ROLE_USER)) {
      return { code: 1, msg: 'Success [user]' };
    }
    if (
      props.userRolesLocal.includes(ROLE_ADMIN) ||
      props.userRolesLocal.includes(ROLE_SUPER_ADMIN)
    ) {
      return { code: 2, msg: 'Success [admin or super]' };
    }
  }
}

export default checkAuth;
