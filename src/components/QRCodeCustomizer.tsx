import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { QRCodeSVG } from 'qrcode.react';
import { Palette, Image as ImageIcon, LayoutGrid, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QRCodeCustomizerProps {
    fgColor: string;
    bgColor: string;
    includeMargin: boolean;
    level: string;
    logoUrl: string | null;
    logoSize: number;
    onChange: (field: string, value: any) => void;
    previewUrl: string;
}

export function QRCodeCustomizer({
    fgColor,
    bgColor,
    includeMargin,
    level,
    logoUrl,
    logoSize,
    onChange,
    previewUrl
}: QRCodeCustomizerProps) {
    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row gap-10 items-start">
                {/* Preview Section */}
                <div className="w-full lg:w-auto flex flex-col items-center space-y-6 shrink-0">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#E85A70]/20 to-[#3B82F6]/20 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                        <Card className="relative p-8 bg-white dark:bg-white/5 border-none shadow-2xl shadow-black/5 rounded-[32px] overflow-hidden">
                            <QRCodeSVG
                                value={previewUrl}
                                size={180}
                                fgColor={fgColor}
                                bgColor={bgColor}
                                includeMargin={includeMargin}
                                level={level as any}
                                imageSettings={logoUrl ? {
                                    src: logoUrl,
                                    height: logoSize,
                                    width: logoSize,
                                    excavate: true,
                                } : undefined}
                                className="transition-all duration-500"
                            />
                        </Card>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-full border border-[#ede7e4] dark:border-white/10">
                        <Info className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Preview em tempo real</span>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex-1 w-full space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-sm font-bold text-[#1c1c1e] dark:text-gray-300">
                                <div className="w-6 h-6 rounded-lg bg-[#FDF2F4] dark:bg-[#E85A70]/10 flex items-center justify-center">
                                    <Palette className="w-3.5 h-3.5 text-[#E85A70]" />
                                </div>
                                Cor do Código
                            </Label>
                            <div className="flex gap-3">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#ede7e4] dark:border-white/10 shrink-0">
                                    <Input
                                        type="color"
                                        value={fgColor}
                                        onChange={(e) => onChange('qr_code_fg_color', e.target.value)}
                                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={fgColor}
                                    onChange={(e) => onChange('qr_code_fg_color', e.target.value)}
                                    className="h-12 font-mono rounded-xl border-[#ede7e4] dark:border-white/10 focus-visible:ring-[#E85A70]/30"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="flex items-center gap-2 text-sm font-bold text-[#1c1c1e] dark:text-gray-300">
                                <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                    <Palette className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                                Cor de Fundo
                            </Label>
                            <div className="flex gap-3">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#ede7e4] dark:border-white/10 shrink-0">
                                    <Input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => onChange('qr_code_bg_color', e.target.value)}
                                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                                    />
                                </div>
                                <Input
                                    type="text"
                                    value={bgColor}
                                    onChange={(e) => onChange('qr_code_bg_color', e.target.value)}
                                    className="h-12 font-mono rounded-xl border-[#ede7e4] dark:border-white/10 focus-visible:ring-[#E85A70]/30"
                                    placeholder="#FFFFFF"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#ede7e4] dark:border-white/10 space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-[#ede7e4] dark:border-white/10">
                            <div className="space-y-0.5">
                                <Label className="flex items-center gap-2 text-sm font-bold">
                                    <LayoutGrid className="w-4 h-4 text-[#3B82F6]" />
                                    Margem de Segurança
                                </Label>
                                <p className="text-xs text-gray-400">Melhora a leitura em ambientes escuros.</p>
                            </div>
                            <Switch
                                checked={includeMargin}
                                onCheckedChange={(checked) => onChange('qr_code_margin', checked)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-sm font-bold">
                                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                Logo Central <span className="text-[10px] text-gray-400 uppercase font-normal ml-auto">(opcional)</span>
                            </Label>
                            <div className="space-y-4">
                                <Input
                                    type="url"
                                    value={logoUrl || ''}
                                    onChange={(e) => onChange('qr_code_logo_url', e.target.value)}
                                    placeholder="https://exemplo.com/logo.png"
                                    className="h-12 rounded-xl border-[#ede7e4] dark:border-white/10 focus-visible:ring-blue-500/20"
                                />
                                {logoUrl && (
                                    <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Tamanho do Logo: {logoSize}px</Label>
                                        </div>
                                        <input
                                            type="range"
                                            min="16"
                                            max="48"
                                            value={logoSize}
                                            onChange={(e) => onChange('qr_code_logo_size', parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
