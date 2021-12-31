from django.db import models


class Skin(models.Model):
    name = models.CharField(default='', max_length=256, blank=True, null=True, verbose_name='皮肤名')
    imgSrc = models.URLField(max_length=256, blank=True, verbose_name='皮肤图片地址')
    description = models.TextField(default='', blank=True, verbose_name='皮肤描述')

    def __str__(self):  # 展示在数据库中的名字
        return str(self.name)
