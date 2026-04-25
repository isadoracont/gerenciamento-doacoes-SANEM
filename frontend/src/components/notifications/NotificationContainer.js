"use client";
import React from 'react';
import styles from './notifications.module.css';

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className={styles.notificationContainer}>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification, onRemove }) => {
  const { id, message, type } = notification;

  return (
    <div 
      className={`${styles.notification} ${styles[type]}`}
      onClick={() => onRemove(id)}
    >
      <div className={styles.notificationContent}>
        <span className={styles.notificationMessage}>{message}</span>
        <button 
          className={styles.notificationClose}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationContainer;

