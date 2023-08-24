import {
  Fragment,
  useState,
  forwardRef,
  useImperativeHandle,
  ReactNode,
  Ref,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'phosphor-react';

interface ModalProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ModalZoomComponent(
  { title, children, className }: ModalProps,
  ref: Ref<HTMLInputElement | any>
) {
  let [isOpen, setIsOpen] = useState(false);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  useImperativeHandle(ref, () => {
    return {
      openModal,
      closeModal,
    };
  });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full max-w-md transform overflow-hidden rounded-lg p-6 md:p-8 text-left align-middle shadow-xl transition-all relative ${className}`}>
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                <div className="relative z-10">
                  <button
                    type="button"
                    className="btn btn-ghost btn-square absolute top-0 right-0"
                    onClick={closeModal}
                  >
                    <X size={24} />
                  </button>

                  <Dialog.Title as="h3" className="title-1">
                    {title}
                  </Dialog.Title>

                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export const ModalZoom = forwardRef(ModalZoomComponent);
