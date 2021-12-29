from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Message(models.Model):
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING, verbose_name='用户名')  # 关联用户表
    photo = models.URLField(max_length=256, blank=True, verbose_name='头像图片地址')
    text = models.TextField(blank=True, default='', verbose_name='留言内容')
    create_time = models.DateTimeField(default=timezone.now(), null=False, blank=False, verbose_name='创建时间')

    def __str__(self):  # 展示在数据库中的名字
        return str(self.user)
