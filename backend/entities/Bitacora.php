<?php

use Illuminate\Database\Eloquent\Model;

class Bitacora extends Model {
    protected $table = 'bitacora';
    public $timestamps = false;

    public function tipoAccion() {
        return $this->belongsTo(TipoAccion::class, 'tipo_accion_id');
    }

    public function usuario() {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
