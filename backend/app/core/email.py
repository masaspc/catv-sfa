"""メール送信ユーティリティ"""
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from jinja2 import Template

from app.core.config import settings


class EmailService:
    """メール送信サービス"""

    def __init__(self):
        self.smtp_host = getattr(settings, 'SMTP_HOST', 'localhost')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_user = getattr(settings, 'SMTP_USER', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', 'noreply@catv-sfa.local')
        self.from_name = getattr(settings, 'FROM_NAME', 'CATV SFA')

    def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        """
        メールを送信

        Args:
            to_email: 宛先メールアドレス
            subject: 件名
            body_html: HTML本文
            body_text: テキスト本文（省略可）
            cc: CCアドレスリスト（省略可）
            bcc: BCCアドレスリスト（省略可）

        Returns:
            送信成功の場合True
        """
        try:
            # メッセージ作成
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email

            if cc:
                msg['Cc'] = ', '.join(cc)
            if bcc:
                msg['Bcc'] = ', '.join(bcc)

            # テキスト部分
            if body_text:
                part1 = MIMEText(body_text, 'plain', 'utf-8')
                msg.attach(part1)

            # HTML部分
            part2 = MIMEText(body_html, 'html', 'utf-8')
            msg.attach(part2)

            # SMTP接続・送信
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)

                recipients = [to_email]
                if cc:
                    recipients.extend(cc)
                if bcc:
                    recipients.extend(bcc)

                server.send_message(msg, from_addr=self.from_email, to_addrs=recipients)

            return True

        except Exception as e:
            # 本番環境ではログに記録
            print(f"メール送信エラー: {e}")
            return False

    def render_template(self, template_name: str, context: dict) -> str:
        """
        テンプレートをレンダリング

        Args:
            template_name: テンプレート名
            context: テンプレート変数

        Returns:
            レンダリング済みHTML
        """
        template_path = Path(__file__).parent.parent / 'templates' / 'email' / f'{template_name}.html'

        if not template_path.exists():
            # テンプレートが存在しない場合はデフォルトテンプレート使用
            return self._default_template(context)

        with open(template_path, 'r', encoding='utf-8') as f:
            template_str = f.read()

        template = Template(template_str)
        return template.render(**context)

    def _default_template(self, context: dict) -> str:
        """デフォルトテンプレート"""
        title = context.get('title', '')
        message = context.get('message', '')
        action_url = context.get('action_url', '')
        action_text = context.get('action_text', '詳細を見る')

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; }}
                .content {{ background-color: #f9fafb; padding: 30px; }}
                .button {{ display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>CATV SFA</h1>
                </div>
                <div class="content">
                    <h2>{title}</h2>
                    <p>{message}</p>
                    {f'<a href="{action_url}" class="button">{action_text}</a>' if action_url else ''}
                </div>
                <div class="footer">
                    <p>このメールは CATV SFA から自動送信されています。</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html


# グローバルインスタンス
email_service = EmailService()
