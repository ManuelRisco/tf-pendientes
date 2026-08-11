<?php

use Illuminate\Database\Eloquent\Model;

class TipoAccion extends Model {
    protected $table = 'tipos_acciones';
    public $timestamps = false;
    
    public function bitacoras() {
        return $this->hasMany(Bitacora::class, 'tipo_accion_id');
    }
}
