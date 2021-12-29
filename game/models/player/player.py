from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    # 关联用户表,当用户表删除时Player表也会删除
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='用户名')
    photo = models.URLField(max_length=256, blank=True, verbose_name='头像图片地址')
    openid = models.CharField(
        default='', max_length=50, blank=True, null=True)  # 用户唯一标识
    score = models.IntegerField(default=1500, verbose_name='累计得分')  # 累计得分

    def __str__(self):  # 展示在数据库中的名字
        return str(self.user)
