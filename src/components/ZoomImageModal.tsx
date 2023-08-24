import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { ModalZoom } from '@components/Modal';
import { X } from 'phosphor-react';

interface ZoomImageModalProps {
  imageIpfs: string;
}

const ZoomImageModal = forwardRef((props: ZoomImageModalProps, ref) => {
  const { imageIpfs } = props;
  const modalRef = useRef(null);

  const handleImageClick = () => {
    modalRef.current.openModal();
  };

  useImperativeHandle(ref, () => ({
    openModal: () => {
      if (modalRef.current) {
        modalRef.current.openModal();
      }
    },
    closeModal: () => {
      if (modalRef.current) {
        modalRef.current.closeModal();
      }
    }
  }));
  return (
    <div>
      <ModalZoom ref={modalRef} title="" className="max-w-none">
        <button type="button" className="btn btn-square absolute top-0 right-0" onClick={() => modalRef.current && modalRef.current.closeModal()}>
          <X size={24} />
        </button>
        <div className="flex justify-start items-start md:justify-center md:items-center overflow-auto h-full w-full">
          <img src={imageIpfs} alt="Zoomed Image" className="h-[88vh] w-auto max-w-none" />
        </div>
      </ModalZoom>
    </div>
  );

});

ZoomImageModal.displayName = 'ZoomImageModal';

export default ZoomImageModal;
