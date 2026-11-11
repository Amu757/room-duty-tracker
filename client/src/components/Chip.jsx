import { K } from '../constants';
export default function Chip({ name }) {
  return <span className={`chip ${K[name]}`}>{name}</span>;
}
