"use client";

import type { ProfileData } from "@/config/site";
import {
  BioEditor,
  Card,
  Field,
  ImageField,
  StringList,
  TextArea,
  TextInput,
} from "./ui";

export function ProfileTab({
  profile,
  onChange,
}: {
  profile: ProfileData;
  onChange: (next: ProfileData) => void;
}) {
  const patch = (fields: Partial<ProfileData>) =>
    onChange({ ...profile, ...fields });

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <Card title="基本身份">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="名字">
              <TextInput
                value={profile.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </Field>
            <Field label="页眉字符标" hint="左上角的小 logo 文字">
              <TextInput
                value={profile.logo}
                onChange={(e) => patch({ logo: e.target.value })}
              />
            </Field>
            <Field label="头衔">
              <TextInput
                value={profile.role}
                onChange={(e) => patch({ role: e.target.value })}
              />
            </Field>
            <Field label="公司 / 身份">
              <TextInput
                value={profile.company}
                onChange={(e) => patch({ company: e.target.value })}
              />
            </Field>
            <Field label="地点">
              <TextInput
                value={profile.location}
                onChange={(e) => patch({ location: e.target.value })}
              />
            </Field>
            <Field label="地图链接" hint="点击地点时打开的链接">
              <TextInput
                value={profile.locationUrl}
                onChange={(e) => patch({ locationUrl: e.target.value.trim() })}
              />
            </Field>
            <Field label="邮箱">
              <TextInput
                value={profile.email}
                onChange={(e) => patch({ email: e.target.value.trim() })}
              />
            </Field>
          </div>
          <div className="mt-4">
            <ImageField
              label="头像"
              target="avatar"
              value={profile.avatar}
              onChange={(avatar) => avatar && patch({ avatar })}
              removable={false}
              hint="建议正方形图片；上传后自动替换站点头像"
            />
          </div>
        </Card>

        <Card title="首页文案">
          <div className="space-y-4">
            <Field label="开场白" hint="首页大字问候下面的一句话">
              <TextArea
                rows={2}
                value={profile.intro}
                onChange={(e) => patch({ intro: e.target.value })}
              />
            </Field>
            <Field label="SEO 描述" hint="分享到微信 / 搜索引擎时显示的一句话">
              <TextArea
                rows={2}
                value={profile.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Field>
            <StringList
              label="轮换标语"
              items={profile.taglines}
              onChange={(taglines) => patch({ taglines })}
              addLabel="添加标语"
              hint="首页名字旁边轮播展示的短词"
            />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card title="关于">
          <BioEditor
            value={profile.bio}
            onChange={(bio) => patch({ bio })}
          />
        </Card>

        <Card title="页脚">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="备案号（可选）">
              <TextInput
                value={profile.icp}
                onChange={(e) => patch({ icp: e.target.value.trim() })}
              />
            </Field>
            <Field label="页脚注记">
              <TextInput
                value={profile.footerNote}
                onChange={(e) => patch({ footerNote: e.target.value })}
              />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
