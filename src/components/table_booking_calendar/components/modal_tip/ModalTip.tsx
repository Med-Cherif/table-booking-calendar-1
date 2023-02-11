import { ReactNode, forwardRef } from 'react';
import './style/index.scss';
interface ModalTipProps {
  children?: ReactNode;
  onClose?: () => void;
  props: {
    [prop: string]: any;
    style: React.CSSProperties;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'aria-labelledby'?: string | undefined;
  };
}
export default forwardRef<HTMLDivElement, ModalTipProps>(function ModalTip(
  { children, onClose, props }: ModalTipProps,
  ref,
) {
  return (
    <>
      <div className="modal-tip-backdrop" onClick={onClose} />
      <div className="modal-tip" {...props} ref={ref}>
        {children}
        <button
          type="button"
          className="btn-close close"
          aria-label="Close"
          onClick={onClose}
        />
      </div>
    </>
  );
});
