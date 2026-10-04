<?php
namespace App\Services;

class WhatsAppLinkBuilder {
    public function build(string $phone, string $message): string {
        return 'https://wa.me/'.$this->normalizePhone($phone).'?text='.rawurlencode($message);
    }
    public function normalizePhone(string $phone): string {
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) === 11) $digits = '55'.$digits;
        return $digits;
    }
}
