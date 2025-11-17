import api from './api'

export interface EmailTest {
  to_email: string
  subject: string
  message: string
}

export interface EmailNotificationResponse {
  message: string
  sent_count: number
  total_deals?: number
  total_activities?: number
  total_users?: number
  total_contracts?: number
}

export const emailApi = {
  // テストメール送信
  sendTestEmail: async (data: EmailTest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/email/test', data)
    return response.data
  },

  // 案件期限通知を一括送信
  sendDealDeadlineNotifications: async (): Promise<EmailNotificationResponse> => {
    const response = await api.post<EmailNotificationResponse>('/email/notifications/deal-deadlines')
    return response.data
  },

  // 営業活動フォローアップ通知を一括送信
  sendActivityFollowUpNotifications: async (): Promise<EmailNotificationResponse> => {
    const response = await api.post<EmailNotificationResponse>('/email/notifications/activity-follow-ups')
    return response.data
  },

  // 日報未提出リマインダーを一括送信
  sendDailyReportReminders: async (): Promise<EmailNotificationResponse> => {
    const response = await api.post<EmailNotificationResponse>('/email/notifications/daily-report-reminders')
    return response.data
  },

  // 契約更新通知を一括送信
  sendContractRenewalNotifications: async (): Promise<EmailNotificationResponse> => {
    const response = await api.post<EmailNotificationResponse>('/email/notifications/contract-renewals')
    return response.data
  },

  // 週次レポートを一括送信
  sendWeeklyReports: async (): Promise<EmailNotificationResponse> => {
    const response = await api.post<EmailNotificationResponse>('/email/notifications/weekly-reports')
    return response.data
  },
}
