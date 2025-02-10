const formatDateNumber = (n: number) => (n < 10 ? '0' : '') + n.toString();

const formatDate = (date: Date) =>
  `${formatDateNumber(date.getDate())}/${formatDateNumber(date.getMonth() + 1)}/${date.getFullYear()}`;

export { formatDate };
