import jwt from 'jsonwebtoken';

export function isEmpty(obj) {
  return !!(!obj || JSON.stringify(obj === '{}'));
}

export function generateId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

export async function authorize(ctx, next) {
  const token = ctx.headers.authorization;
  try {
    jwt.verify(token, process.env.SECRET);
  } catch (err) {
    ctx.set('X-Status-Reason', err.message);
    ctx.throw(401, 'Not Authorized');
  }

  await next();
}

export function getUndefinedFields(targetObj, fieldsList) {
  return fieldsList.filter(field => !targetObj[field]).join(', ');
}
