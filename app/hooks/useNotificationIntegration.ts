import { useEffect } from 'react';
import { useDeal, DealRequest } from '../context/DealContext';
import { useNotification } from '../context/NotificationContext';

export function useNotificationIntegration() {
  const { setNotificationCallback } = useDeal();
  const { addNotification } = useNotification();

  useEffect(() => {
    // Set up the callback to trigger notifications
    setNotificationCallback((type: string, deal: DealRequest) => {
      switch (type) {
        case 'NEW_REQUEST':
          // Notify worker about new request
          addNotification({
            userId: deal.workerId,
            title: 'New Deal Request',
            message: `${deal.customerName} sent you a deal request.`,
            type: 'NEW_REQUEST',
            relatedDealId: deal.id,
          });
          break;

        case 'REQUEST_ACCEPTED':
          // Notify customer that request was accepted
          addNotification({
            userId: deal.customerId,
            title: 'Request Accepted! 🎉',
            message: `${deal.workerName} accepted your request.`,
            type: 'REQUEST_ACCEPTED',
            relatedDealId: deal.id,
          });
          break;

        case 'REQUEST_WAITLISTED':
          // Notify customer that request was waitlisted
          addNotification({
            userId: deal.customerId,
            title: 'Request Waitlisted',
            message: `${deal.workerName} added your request to waitlist.`,
            type: 'REQUEST_WAITLISTED',
            relatedDealId: deal.id,
          });
          break;

        case 'REQUEST_REJECTED':
          // Notify customer that request was rejected
          addNotification({
            userId: deal.customerId,
            title: 'Request Declined',
            message: `${deal.workerName} declined your request.`,
            type: 'REQUEST_REJECTED',
            relatedDealId: deal.id,
          });
          break;

        case 'STATUS_UPDATE':
          // Notify customer about work status update
          const statusMessage = deal.workStatus === 'ONGOING' 
            ? `${deal.workerName} started working on your request.`
            : `${deal.workerName} completed the work!`;
          
          addNotification({
            userId: deal.customerId,
            title: 'Work Status Updated',
            message: statusMessage,
            type: 'STATUS_UPDATE',
            relatedDealId: deal.id,
          });
          break;

        case 'REVIEW_RECEIVED':
          // Notify worker about review received
          addNotification({
            userId: deal.workerId,
            title: 'New Review Received ⭐',
            message: `${deal.customerName} left you a ${deal.review?.rating}-star review.`,
            type: 'REVIEW_RECEIVED',
            relatedDealId: deal.id,
          });
          break;
      }
    });
  }, [setNotificationCallback, addNotification]);
}
